import test from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const enabled = process.env.RUN_BROWSER_TESTS === '1'
const css = fileURLToPath(new URL('../public/dashboard/style.css', import.meta.url))
const script = fileURLToPath(new URL('../public/dashboard/traversal.js', import.meta.url))
const node = (page, id) => page.locator(`button.traversal-graph-node[data-node-id="${id}"]`)
const control = (page, action) => page.locator(`[data-traversal-action="${action}"]`)
const event = (id, kind, fields = {}) => ({ id, kind, at: new Date(Date.UTC(2026, 9, 12, 12, 0, 0, id * 100)).toISOString(), elapsed_ms: id * 100, ...fields })

function fixture() {
  return {
    tasks: [
      { trial_id: 'task-a', task_id: 'Branch and backtrack task', index: 1, status: 'completed', completed_at: '2026-10-12T12:01:00Z', recorded: true, grade: { status: 'passed' } },
      { trial_id: 'task-b', task_id: 'Separate task', index: 2, status: 'completed', completed_at: '2026-10-12T12:02:00Z', recorded: true, grade: { status: 'passed' } },
    ],
    events: {
      'task-a': [
        event(1, 'start'),
        event(2, 'request', { page_id: 'a', path: '/bestbuy', method: 'GET', status: 200, html: true }),
        event(3, 'page', { page_id: 'a', path: '/bestbuy', navigation: 'navigate' }),
        event(4, 'click', { page_id: 'a', path: '/bestbuy/cart', label: 'Open cart <img src=x onerror="window.graphXss=true">' }),
        event(5, 'request', { page_id: 'b', path: '/bestbuy/cart', method: 'GET', status: 200, html: true }),
        event(6, 'page', { page_id: 'b', parent_page_id: 'a', path: '/bestbuy/cart', navigation: 'navigate' }),
        event(7, 'request', { page_id: 'c', path: '/bestbuy', method: 'GET', status: 200, html: true }),
        event(8, 'page', { page_id: 'c', parent_page_id: 'a', path: '/bestbuy', navigation: 'navigate' }),
        event(9, 'navigation', { page_id: 'a', parent_page_id: 'c', path: '/bestbuy', navigation: 'back_forward' }),
        event(10, 'request', { page_id: 'orphan', path: '/bestbuy/account', method: 'GET', status: 200, html: true }),
        event(11, 'page', { page_id: 'orphan', parent_page_id: 'not-in-record', path: '/bestbuy/account', navigation: 'navigate' }),
        event(12, 'request', { path: '/bestbuy/cart/add', method: 'POST', status: 302, html: false }),
        // Earlier captures did not identify a source page for BFCache revisits.
        event(13, 'navigation', { page_id: 'b', path: '/bestbuy/cart', navigation: 'back_forward' }),
        event(14, 'complete'),
      ],
      'task-b': [
        event(1, 'request', { page_id: 'z', path: '/gamestop', method: 'GET', status: 200, html: true }),
        event(2, 'page', { page_id: 'z', path: '/gamestop', navigation: 'navigate' }),
      ],
    },
  }
}

async function mount(t, data = fixture()) {
  const browser = await chromium.launch({ headless: true })
  t.after(() => browser.close())
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.setContent('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Traversal graph fixture</title></head><body><dialog id="traversal-dialog" class="traversal-dialog" aria-labelledby="traversal-title"></dialog></body></html>')
  await page.addStyleTag({ path: css })
  await page.addScriptTag({ path: script })
  await page.evaluate(data => {
    window.graphFixture = data
    window.graphApiRequests = []
    const api = async route => {
      window.graphApiRequests.push(route)
      const current = window.graphFixture
      if (route.endsWith('/traversal')) return { tasks: current.tasks.map(task => ({ ...task, event_count: current.events[task.trial_id].length })) }
      const [pathname, query] = route.split('?'), trialId = decodeURIComponent(pathname.split('/').at(-1))
      const after = Number(new URLSearchParams(query).get('after')) || 0
      const rows = current.events[trialId] || []
      return { trial_id: trialId, events: rows.filter(event => event.id > after), event_count: rows.length, next_cursor: null }
    }
    window.graphController = window.DashboardTraversal.create({ api })
    window.graphController.open({ runId: 'run-one', attemptId: 'attempt-one', label: 'Muse' })
  }, data)
  await node(page, 'page:a').waitFor()
  return { page, errors }
}

test('connected traversal graph retains branches, explicit return edges and distinct visits without inventing links', { skip: !enabled, timeout: 60_000 }, async t => {
  const { page, errors } = await mount(t)
  assert.equal(await page.locator('button.traversal-graph-node').count(), 5)
  for (const id of ['page:a', 'page:b', 'page:c', 'page:orphan', 'unlinked']) assert.equal(await node(page, id).count(), 1)
  const edges = await page.locator('path.traversal-graph-edge').evaluateAll(elements => elements.map(element => ({
    from: element.dataset.from, to: element.dataset.to, relation: element.dataset.relation, path: element.getAttribute('d'),
  })))
  assert.deepEqual(edges.map(({ from, to, relation }) => [from, to, relation]).sort(), [
    ['page:a', 'page:b', 'parent'], ['page:a', 'page:c', 'parent'], ['page:c', 'page:a', 'parent'],
  ].sort())
  assert.ok(edges.every(edge => edge.path?.length > 8))
  const positions = await page.locator('button.traversal-graph-node').evaluateAll(elements => elements.map(element => {
    const bounds = element.getBoundingClientRect(); return `${Math.round(bounds.x)},${Math.round(bounds.y)}`
  }))
  assert.equal(new Set(positions).size, 5, 'Graph nodes must occupy distinct positions')
  await node(page, 'page:a').focus()
  await page.keyboard.press('Enter')
  assert.match(await page.locator('.traversal-inspector').innerText(), /<img src=x/)
  assert.equal(await page.locator('.traversal-inspector img').count(), 0)
  assert.equal(await page.evaluate(() => window.graphXss), undefined)
  // Enter selects a focused graph node and opens its recorded actions.
  await node(page, 'page:b').focus()
  await page.keyboard.press('Enter')
  assert.equal(await node(page, 'page:b').getAttribute('aria-pressed'), 'true')
  await page.locator('.traversal-inspector').getByText('Back / forward', { exact: false }).waitFor()
  await node(page, 'unlinked').focus()
  await page.keyboard.press('Enter')
  assert.match(await page.locator('.traversal-inspector').innerText(), /POST/)
  assert.match(await page.locator('.traversal-inspector').innerText(), /302/)
  assert.match(await page.locator('.traversal-inspector').innerText(), /\/bestbuy\/cart\/add/)
  await page.locator('[data-traversal-mode="events"]').click()
  assert.equal(await page.locator('button.traversal-graph-node').count(), 14)
  assert.equal(await page.locator('path.traversal-graph-edge[data-relation="sequence"]').count(), 13)
  assert.match(await page.locator('#traversal-dialog').innerText(), /recorded order/i)
  await node(page, 'event:12').focus()
  await page.keyboard.press('Enter')
  assert.match(await page.locator('.traversal-inspector').innerText(), /\/bestbuy\/cart\/add/)
  assert.deepEqual(errors, [])
})

test('graph refresh and task switching preserve each view while fit and keyboard zoom remain usable', { skip: !enabled, timeout: 60_000 }, async t => {
  const { page, errors } = await mount(t)
  const viewport = page.locator('.traversal-graph-viewport')
  const initialTransform = await page.locator('.traversal-graph-scene').evaluate(element => element.style.transform)
  const bounds = await viewport.boundingBox()
  await page.mouse.move(bounds.x + 8, bounds.y + 8)
  await page.mouse.down()
  await page.mouse.move(bounds.x + 78, bounds.y + 53, { steps: 5 })
  await page.mouse.up()
  assert.notEqual(await page.locator('.traversal-graph-scene').evaluate(element => element.style.transform), initialTransform)
  await node(page, 'page:b').focus()
  await page.keyboard.press('Enter')
  const initialZoom = Number(await viewport.getAttribute('data-zoom'))
  await control(page, 'zoom-in').focus()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
  const zoom = await viewport.getAttribute('data-zoom')
  assert.ok(Number(zoom) > initialZoom)
  const transform = await page.locator('.traversal-graph-scene').evaluate(element => element.style.transform)
  await page.locator('[data-traversal-task="task-b"]').click()
  await node(page, 'page:z').waitFor()
  assert.equal(await node(page, 'page:b').count(), 0)
  await control(page, 'zoom-out').click()
  const secondZoom = await viewport.getAttribute('data-zoom')
  await page.locator('[data-traversal-task="task-a"]').click()
  await node(page, 'page:b').waitFor()
  assert.equal(await viewport.getAttribute('data-zoom'), zoom)
  assert.equal(await page.locator('.traversal-graph-scene').evaluate(element => element.style.transform), transform)
  assert.equal(await node(page, 'page:b').getAttribute('aria-pressed'), 'true')
  // New observations refresh the layout without resetting the inspection view.
  await page.evaluate(extra => window.graphFixture.events['task-a'].push(...extra), [
    event(15, 'request', { page_id: 'new', path: '/bestbuy/checkout', method: 'GET', status: 200, html: true }),
    event(16, 'page', { page_id: 'new', parent_page_id: 'b', path: '/bestbuy/checkout', navigation: 'navigate' }),
  ])
  await control(page, 'refresh').click()
  await node(page, 'page:new').waitFor()
  assert.equal(await viewport.getAttribute('data-zoom'), zoom)
  assert.equal(await node(page, 'page:b').getAttribute('aria-pressed'), 'true')
  await page.locator('[data-traversal-task="task-b"]').click()
  await node(page, 'page:z').waitFor()
  assert.equal(await viewport.getAttribute('data-zoom'), secondZoom)
  await page.locator('[data-traversal-task="task-a"]').click()
  await node(page, 'page:new').waitFor()
  await page.setViewportSize({ width: 390, height: 844 })
  await control(page, 'fit').click()
  const allVisible = await viewport.evaluate(element => {
    const outer = element.getBoundingClientRect()
    return [...element.querySelectorAll('.traversal-graph-node')].every(node => {
      const rect = node.getBoundingClientRect()
      return rect.left >= outer.left - 1 && rect.right <= outer.right + 1 && rect.top >= outer.top - 1 && rect.bottom <= outer.bottom + 1
    })
  })
  assert.equal(allVisible, true, 'Fit view should contain every graph node on a narrow screen')
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  assert.deepEqual(errors, [])
})
