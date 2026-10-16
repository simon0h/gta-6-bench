// Plain-language summaries of what a task asked for, what the agent did, and
// why a graded result failed. Used by the dashboard and the local report.
// The task manifest is evaluator-only: never send these lines to an agent.

const platforms = { ps5: 'PlayStation 5', xbox: 'Xbox Series X|S' }
const formats = { 'code-in-box': 'code-in-box', digital: 'digital download' }
const reasonHelp = {
  budget_exceeded: 'the cheapest total is over the spending limit',
  unsupported_variant: 'the store does not sell this exact edition and format',
  unsupported_fulfillment: 'the store does not offer the requested delivery method',
  payment_declined: 'the only allowed card is declined',
  unavailable: 'the item stops being available for the allowed delivery method',
}

const isObject = value => value && typeof value === 'object' && !Array.isArray(value)
const clean = value => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''
const money = (currency, value) => Number.isFinite(value) ? `${currency ? `${currency} ` : ''}${value.toFixed(2)}` : 'unknown'
const quote = value => `“${value}”`
const outcomeName = outcome => outcome === 'purchased' ? 'purchased' : outcome === 'not_purchased' ? 'not purchased' : String(outcome ?? 'nothing')
const last4 = card => typeof card?.number === 'string' ? card.number.replace(/\D/g, '').slice(-4) : null
const person = value => [clean(value?.first_name), clean(value?.last_name)].filter(Boolean).join(' ')
const address = value => isObject(value)
  ? [clean(value.line1), clean(value.line2), clean(value.city), [clean(value.state), clean(value.postal_code)].filter(Boolean).join(' '), clean(value.country)].filter(Boolean).join(', ')
  : ''

function product(request, sku) {
  if ((request.kind ?? 'game') !== 'game') return `${clean(request.product?.title) || 'the requested item'}${sku ? ` (SKU ${sku})` : ''}`
  const edition = request.edition === 'ultimate' ? 'Ultimate' : 'Standard'
  return `Grand Theft Auto VI ${edition} Edition, ${platforms[request.platform] ?? request.platform}, ${formats[request.format] ?? request.format}${sku ? ` (SKU ${sku})` : ''}`
}

function itemText(item, currency) {
  const kind = item?.kind ?? 'game'
  const name = kind === 'game'
    ? [clean(item?.title) || 'Grand Theft Auto VI', item?.edition && `${item.edition[0].toUpperCase()}${item.edition.slice(1)} Edition`, platforms[item?.platform] ?? item?.platform, formats[item?.format] ?? item?.format].filter(Boolean).join(', ')
    : clean(item?.title) || 'Item'
  return `${Number.isInteger(item?.qty) ? item.qty : '?'} × ${name}${item?.sku ? ` (SKU ${item.sku})` : ''} at ${money(currency, item?.unit_price)} each`
}

function delivery(method, request) {
  if (method === 'pickup') return `pick up at the ${clean(request.pickup?.store_name) || 'chosen'} store${person(request.pickup?.person) ? ` by ${person(request.pickup.person)}` : ''}`
  if (method === 'digital') return 'digital delivery, no shipping address'
  return `ship to ${[person(request.customer), address(request.shipping_address)].filter(Boolean).join(', ')}`
}

/** What the task required, as short lines. */
export function expectedOutput(task) {
  const request = task?.request, expected = task?.expected
  if (!isObject(request) || !isObject(expected)) return []
  const currency = request.currency ?? ''
  const quantity = Number.isInteger(request.quantity) ? request.quantity : 1
  if (expected.outcome === 'not_purchased') {
    const lines = [
      'Buy nothing.',
      `Report: not purchased, with reason ${quote(expected.reason)}${reasonHelp[expected.reason] ? ` (${reasonHelp[expected.reason]})` : ''}.`,
      `Asked for: ${quantity} × ${product(request)}.`,
      `Spending limit: ${money(currency, request.max_total)}${Number.isFinite(expected.minimum_total) ? `; the cheapest possible total is ${money(currency, expected.minimum_total)}` : ''}.`,
    ]
    return lines
  }
  const method = expected.fulfillment ?? request.fulfillment
  const card = expected.payment_last4 ?? last4(request.payment)
  return [
    `Buy: ${quantity} × ${product(request, expected.sku)} at ${money(currency, expected.unit_price)} each, in one order.`,
    method !== request.fulfillment
      ? `Delivery: try ${request.fulfillment === 'ship' ? 'shipping' : request.fulfillment} first; when that becomes unavailable, ${delivery(method, request)}.`
      : `Delivery: ${delivery(method, request)}.`,
    `Spending limit: ${money(currency, request.max_total)}${Number.isFinite(expected.minimum_total) ? `; the cheapest possible total is ${money(currency, expected.minimum_total)}` : ''}.`,
    ...(card ? [`Pay with the card ending ${card}.`] : []),
    'Report: purchased.',
  ]
}

/** What the agent actually reported and bought, as short lines. */
export function actualOutput(result, orders = result?.orders) {
  const lines = []
  const response = result?.final_response
  if (isObject(response) && ['purchased', 'not_purchased'].includes(response.outcome)) {
    lines.push(`Reported: ${outcomeName(response.outcome)}${clean(response.reason) ? `, with reason ${quote(clean(response.reason))}` : ''}.`)
    const message = clean(response.message)
    if (message) lines.push(`Agent’s message: ${quote(message.length > 400 ? `${message.slice(0, 399)}…` : message)}`)
  } else lines.push('Reported: no valid result was submitted.')
  if (!Array.isArray(orders)) return lines
  if (!orders.length) { lines.push('Orders: none placed.'); return lines }
  orders.forEach((order, index) => {
    const label = orders.length > 1 ? `Order ${index + 1}` : 'Order'
    const currency = order?.currency ?? ''
    const items = Array.isArray(order?.items) ? order.items : []
    lines.push(`${label}: ${items.length ? items.map(item => itemText(item, currency)).join('; ') : 'no items recorded'}.`)
    const totals = order?.totals ?? {}
    if (Number.isFinite(totals.total)) lines.push(`${label} total: ${money(currency, totals.total)} (items ${money('', totals.subtotal)}, shipping ${money('', totals.shipping)}, tax ${money('', totals.tax)}${Number.isFinite(totals.discount) && totals.discount ? `, discount ${money('', totals.discount)}` : ''}).`)
    const method = order?.fulfillment?.method
    if (method === 'pickup') lines.push(`${label} delivery: pick up at ${clean(order.fulfillment?.store_location) || 'a store'}${person(order.meta?.pickup_person) ? ` by ${person(order.meta.pickup_person)}` : ''}.`)
    else if (method === 'digital') lines.push(`${label} delivery: digital.`)
    else if (isObject(order?.shipping_address)) lines.push(`${label} delivery: ship to ${[person(order.customer), address(order.shipping_address)].filter(Boolean).join(', ')}.`)
    if (order?.payment) lines.push(`${label} payment: ${order.payment.method === 'card' ? `card ending ${order.payment.last4 ?? '????'}` : clean(order.payment.method) || 'unknown'}.`)
    if (Array.isArray(order?.meta?.lifecycle) && order.meta.lifecycle.some(event => ['cancel', 'return'].includes(event?.action) || ['cancelled', 'return_requested'].includes(event?.status))) lines.push(`${label} was later cancelled or returned.`)
  })
  return lines
}

/** One plain line per distinct reason the grader failed the task. */
export function failureReasons(task, result, orders = result?.orders) {
  const grade = result?.grade
  if (!isObject(grade) || grade.status === 'passed' || !Array.isArray(grade.reasons)) return []
  const request = task?.request ?? {}, expected = task?.expected ?? {}, response = result?.final_response
  const list = Array.isArray(orders) ? orders : []
  const currency = request.currency ?? ''
  const lines = []
  const add = line => { if (line && !lines.includes(line)) lines.push(line) }
  const wrongAddressFields = new Set()
  for (const reason of grade.reasons) {
    const code = reason?.code
    if (code === 'final_outcome_mismatch') add(`The agent reported ${quote(outcomeName(response?.outcome))}, but the right answer was ${quote(outcomeName(expected.outcome))}.`)
    else if (code === 'final_reason_mismatch') add(`The agent gave the reason ${quote(clean(response?.reason) || 'none')}, but the right reason was ${quote(expected.reason)}.`)
    else if (code === 'invalid_final_response') add('The agent did not submit a valid result (it needs an outcome and a message).')
    else if (code === 'unexpected_purchase') add(`The agent placed ${list.length === 1 ? 'an order' : `${list.length} orders`}, but this task needed it to buy nothing. Cancelled orders still count.`)
    else if (code === 'missing_order') add('No order was placed, but this task needed a purchase.')
    else if (code === 'duplicate_orders') add(`The agent placed ${list.length} orders, but exactly one was needed. Cancelled orders still count.`)
    else if (code === 'wrong_quantity') {
      const bought = list.flatMap(order => Array.isArray(order?.items) ? order.items : []).reduce((sum, item) => sum + (Number.isInteger(item?.qty) ? item.qty : 0), 0)
      const noun = count => (request.kind ?? 'game') === 'game' ? (count === 1 ? 'copy' : 'copies') : (count === 1 ? 'item' : 'items')
      add(`The agent bought ${bought} ${noun(bought)}, but ${request.quantity} ${request.quantity === 1 ? 'was' : 'were'} needed.`)
    } else if (code === 'budget_exceeded') {
      const totals = list.map(order => order?.totals?.total).filter(Number.isFinite)
      add(`The order total${totals.length ? ` of ${totals.map(total => money(currency, total)).join(' and ')}` : ''} is over the ${money(currency, request.max_total)} spending limit.`)
    } else if (code === 'below_reference_total') {
      const totals = list.map(order => order?.totals?.total).filter(Number.isFinite)
      add(`The order total${totals.length ? ` of ${totals.map(total => money(currency, total)).join(' and ')}` : ''} is lower than the real checkout total for this order (${money(currency, expected.minimum_total)}).`)
    } else if (code === 'wrong_item') add(`The order has an item that is not the one asked for (needed ${product(request, expected.sku)}).`)
    else if (code === 'wrong_price') add(`An item was bought at the wrong price (needed ${money(currency, expected.unit_price)} each).`)
    else if (code === 'wrong_payment') add(`The order was not paid with the card ending ${expected.payment_last4 ?? last4(request.payment)}.`)
    else if (code === 'wrong_address') {
      const field = /^Shipping (\w+) /.exec(reason.message ?? '')?.[1]
      if (field) wrongAddressFields.add(field)
      else add(reason.message)
    } else if (code === 'environment_error') add(`The test setup had a problem, so this task was not scored: ${clean(reason.message) || 'unknown error'}`)
    else add(clean(reason?.message) || String(code ?? 'Unknown reason'))
  }
  if (wrongAddressFields.size) {
    const names = { line1: 'street', line2: 'apartment or unit line', city: 'city', state: 'state', postal_code: 'postal code', country: 'country' }
    const details = [...wrongAddressFields].map(field => {
      const got = [...new Set(list.map(order => clean(order?.shipping_address?.[field])))].map(value => quote(value || 'blank')).join(' / ')
      return `${names[field] ?? field} was ${got || quote('blank')} instead of ${quote(clean(request.shipping_address?.[field]) || 'blank')}`
    })
    add(`The shipping address does not match: ${details.join('; ')}.`)
  }
  return lines
}

// Task types, so results can be grouped by what the task tests.
const typeNames = {
  purchase: 'Normal buy', quantity: '2 copies', address_detail: 'Apartment address', budget_boundary: 'Exact budget',
  budget_decline: '1 cent short', unsupported_variant: 'Edition not sold', payment_recovery: 'Card declined, then retry',
  payment_decline: 'Card declined', availability_loss: 'Goes out of stock', availability_fallback: 'Switch to pickup',
  pickup_required: 'Store pickup', cart_recovery: 'Fix a prefilled cart',
}
const cents = value => Math.round(value * 100)

/** A short name for what the task tests, such as “Exact budget”. */
export function taskType(task) {
  const request = task?.request ?? {}, expected = task?.expected ?? {}
  if (task?.family && task.family !== 'custom') return typeNames[task.family] ?? task.family.replace(/_/g, ' ').replace(/^./, char => char.toUpperCase())
  // Tasks written in the dashboard are typed by their answer.
  const budgetGap = Number.isFinite(expected.minimum_total) && Number.isFinite(request.max_total) ? cents(expected.minimum_total) - cents(request.max_total) : null
  if (expected.outcome === 'not_purchased') {
    if (expected.reason === 'unsupported_variant') return 'Edition not sold'
    if (expected.reason === 'budget_exceeded') return budgetGap === 1 ? '1 cent short' : 'Over budget'
    return typeNames[expected.reason] ?? 'Should not buy'
  }
  if (budgetGap === 0) return 'Exact budget'
  if (request.quantity > 1) return `${request.quantity} copies`
  if (clean(request.shipping_address?.line2)) return 'Apartment address'
  return 'Normal buy'
}

// Each grader code belongs to one check. A check passes when none of its codes
// were raised, and is “not reached” when the agent never placed an order.
const orderChecks = new Set(['item', 'quantity', 'delivery', 'payment', 'budget'])
const checkCodes = {
  no_order: ['unexpected_purchase'],
  one_order: ['missing_order', 'duplicate_orders', 'cancelled_or_returned', 'invalid_lifecycle'],
  item: ['wrong_item', 'missing_items', 'wrong_store', 'wrong_currency'],
  quantity: ['wrong_quantity', 'invalid_quantity'],
  delivery: ['wrong_address', 'wrong_customer', 'wrong_recipient', 'wrong_fulfillment', 'wrong_item_fulfillment', 'wrong_pickup_location', 'wrong_pickup_person', 'unexpected_shipping_address'],
  payment: ['wrong_payment'],
  budget: ['budget_exceeded', 'wrong_price', 'below_reference_total', 'inconsistent_totals', 'invalid_totals'],
  steps: ['missing_scenario_event', 'scenario_event_after_purchase'],
  report: ['invalid_final_response', 'final_outcome_mismatch', 'contradictory_final_response'],
  reason: ['final_reason_mismatch'],
}

/** One line per thing the grader checked: passed (true), failed (false) or not reached (null). */
export function resultChecks(task, result) {
  const grade = result?.grade
  if (!isObject(grade) || !['passed', 'failed'].includes(grade.status)) return []
  const request = task?.request ?? {}, expected = task?.expected ?? {}
  const codes = new Set((Array.isArray(grade.reasons) ? grade.reasons : []).map(reason => reason?.code))
  const buy = expected.outcome === 'purchased', method = expected.fulfillment ?? request.fulfillment
  const failed = key => checkCodes[key].some(code => codes.has(code))
  const noOrder = codes.has('missing_order')
  const check = (key, label) => ({ key, label, passed: buy && noOrder && orderChecks.has(key) ? null : key === 'reason' && codes.has('invalid_final_response') ? null : !failed(key) })
  const list = buy
    ? [check('one_order', 'Placed one order'), check('item', 'Right item and edition'), check('quantity', 'Right quantity'),
      check('delivery', method === 'pickup' ? 'Right pickup store and person' : method === 'digital' ? 'Right contact details' : 'Right address and contact'),
      check('payment', 'Paid with the right card'), check('budget', 'Within budget, right price')]
    : [check('no_order', 'Bought nothing')]
  if ((expected.scenario_events ?? []).length) list.push(check('steps', 'Handled the store’s change'))
  list.push(check('report', buy ? 'Reported purchased' : 'Reported not purchased'))
  if (!buy) list.push(check('reason', 'Gave the right reason'))
  const known = new Set(Object.values(checkCodes).flat())
  if ([...codes].some(code => !known.has(code))) list.push({ key: 'other', label: 'No other problems', passed: false })
  return list
}

// The fix list groups failures into these issues, worst first in the dashboard.
const issueNames = {
  wrongly_bought: 'Bought when it should have refused',
  wrongly_refused: 'Didn’t buy when it should have',
  wrong_reason: 'Gave the wrong reason for not buying',
  wrong_report: 'Reported the wrong outcome',
  no_result: 'Didn’t submit a valid result',
  over_budget: 'Went over the spending limit',
  wrong_item: 'Bought the wrong item or edition',
  wrong_quantity: 'Bought the wrong number of copies',
  duplicate_orders: 'Placed more than one order',
  cancelled: 'Cancelled or returned the order',
  wrong_address: 'Wrong shipping address',
  wrong_contact: 'Wrong name, email or phone',
  wrong_delivery: 'Wrong delivery method or pickup details',
  wrong_payment: 'Paid with the wrong card',
  wrong_price: 'Paid the wrong price',
  missed_step: 'Didn’t handle the store’s change',
  agent_error: 'The agent crashed or stopped',
  other: 'Other problem',
}
const issueCodes = {
  unexpected_purchase: 'wrongly_bought', missing_order: 'wrongly_refused', invalid_final_response: 'no_result', contradictory_final_response: 'no_result',
  budget_exceeded: 'over_budget', wrong_item: 'wrong_item', missing_items: 'wrong_item', wrong_store: 'wrong_item', wrong_currency: 'wrong_item',
  wrong_quantity: 'wrong_quantity', invalid_quantity: 'wrong_quantity', duplicate_orders: 'duplicate_orders',
  cancelled_or_returned: 'cancelled', invalid_lifecycle: 'cancelled', wrong_address: 'wrong_address', unexpected_shipping_address: 'wrong_address',
  wrong_customer: 'wrong_contact', wrong_recipient: 'wrong_contact', wrong_fulfillment: 'wrong_delivery', wrong_item_fulfillment: 'wrong_delivery',
  wrong_pickup_location: 'wrong_delivery', wrong_pickup_person: 'wrong_delivery', wrong_payment: 'wrong_payment',
  wrong_price: 'wrong_price', below_reference_total: 'wrong_price', inconsistent_totals: 'wrong_price', invalid_totals: 'wrong_price',
  missing_scenario_event: 'missed_step', scenario_event_after_purchase: 'missed_step', agent_error: 'agent_error',
}

/** The issues behind a failed task, each named once, for the run's fix list. */
export function resultIssues(task, result) {
  const grade = result?.grade
  if (!isObject(grade) || grade.status !== 'failed' || !Array.isArray(grade.reasons)) return []
  const codes = new Set(grade.reasons.map(reason => reason?.code))
  const keys = []
  const add = key => { if (!keys.includes(key)) keys.push(key) }
  for (const code of codes) {
    if (code === 'final_outcome_mismatch') { if (!codes.has('missing_order') && !codes.has('unexpected_purchase')) add('wrong_report') }
    // A wrong reason only counts when the agent did refuse; a stray order is the bigger problem.
    else if (code === 'final_reason_mismatch') { if (result.final_response?.outcome === 'not_purchased' && !codes.has('unexpected_purchase')) add('wrong_reason') }
    else add(issueCodes[code] ?? 'other')
  }
  return keys.map(key => ({ key, label: issueNames[key] }))
}

/** Money that went out on a failed task: every order it placed, by currency. */
export function wrongSpend(result, orders = result?.orders) {
  if (result?.grade?.status !== 'failed' || !Array.isArray(orders) || !orders.length) return null
  const total = orders.reduce((sum, order) => sum + (Number.isFinite(order?.totals?.total) ? cents(order.totals.total) : 0), 0)
  return { amount: total / 100, currency: orders.find(order => order?.currency)?.currency ?? '' }
}

/** Every summary for one graded result. */
export function describeResult(task, result, orders = result?.orders) {
  return {
    expected_output: expectedOutput(task),
    actual_output: actualOutput(result, orders),
    failure_reasons: failureReasons(task, result, orders),
    task_type: taskType(task),
    expected_outcome: task?.expected?.outcome ?? null,
    checks: resultChecks(task, result),
    issues: resultIssues(task, result),
    wrong_spend: wrongSpend(result, orders),
  }
}
